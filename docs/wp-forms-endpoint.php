<?php
/**
 * BeastFPV forms endpoint for headless frontend.
 *
 * Add this code to active theme `functions.php` on WordPress.
 * Requires WP Mail SMTP Lite configured in WP admin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'beastfpv/v1',
			'/forms/submit',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'beastfpv_forms_submit_callback',
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			'beastfpv/v1',
			'/forms/submit',
			array(
				'methods'             => 'OPTIONS',
				'callback'            => 'beastfpv_forms_options_callback',
				'permission_callback' => '__return_true',
			)
		);
	}
);

add_filter( 'rest_pre_serve_request', 'beastfpv_forms_add_cors_headers', 10, 4 );

function beastfpv_forms_add_cors_headers( $served, $result, $request, $server ) {
	if ( ! ( $request instanceof WP_REST_Request ) ) {
		return $served;
	}

	$route = $request->get_route();
	if ( strpos( $route, '/beastfpv/v1/forms/submit' ) !== 0 ) {
		return $served;
	}

	$origin          = get_http_origin();
	$allowed_origins = apply_filters(
		'beastfpv_forms_allowed_origins',
		array(
			home_url(),
			'https://beastfpv.ru',
			'https://www.beastfpv.ru',
			'http://localhost:3000',
			'http://127.0.0.1:3000',
		)
	);

	if ( $origin && in_array( $origin, $allowed_origins, true ) ) {
		header( 'Access-Control-Allow-Origin: ' . $origin );
		header( 'Vary: Origin' );
	}

	header( 'Access-Control-Allow-Credentials: true' );
	header( 'Access-Control-Allow-Methods: POST, OPTIONS' );
	header( 'Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce' );

	if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'OPTIONS' === strtoupper( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) ) {
		status_header( 204 );
		return true;
	}

	return $served;
}

function beastfpv_forms_options_callback() {
	return new WP_REST_Response( null, 204 );
}

function beastfpv_forms_submit_callback( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$form_type = sanitize_key( $params['form_type'] ?? 'callback' );
	$name      = sanitize_text_field( $params['name'] ?? '' );
	$phone     = beastfpv_forms_normalize_phone( $params['phone'] ?? '' );
	$message   = sanitize_textarea_field( $params['message'] ?? '' );

	$product_name  = sanitize_text_field( $params['product_name'] ?? '' );
	$product_id    = sanitize_text_field( $params['product_id'] ?? '' );
	$product_price = sanitize_text_field( $params['product_price'] ?? '' );
	$page_url      = esc_url_raw( $params['page_url'] ?? '' );

	$honeypot = sanitize_text_field( $params['honeypot'] ?? '' );
	if ( '' === $honeypot ) {
		$honeypot = sanitize_text_field( $params['website'] ?? '' );
	}

	$consent = filter_var( $params['consent'] ?? false, FILTER_VALIDATE_BOOLEAN );

	$allowed_types = array( 'callback', 'one_click', 'preorder' );
	if ( ! in_array( $form_type, $allowed_types, true ) ) {
		return new WP_Error(
			'invalid_form_type',
			'Некорректный тип формы.',
			array( 'status' => 400 )
		);
	}

	if ( ! beastfpv_forms_rate_limit_passed( $form_type ) ) {
		return new WP_Error(
			'rate_limited',
			'Слишком много заявок. Попробуйте снова через несколько минут.',
			array( 'status' => 429 )
		);
	}

	// Honeypot triggered: silently accept to reduce bot retries.
	if ( '' !== $honeypot ) {
		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => 'Заявка принята.',
			),
			200
		);
	}

	if ( '' === $name ) {
		return new WP_Error(
			'validation_error',
			'Поле "Имя" обязательно.',
			array( 'status' => 400 )
		);
	}

	if ( '' === $phone ) {
		return new WP_Error(
			'validation_error',
			'Поле "Телефон" обязательно.',
			array( 'status' => 400 )
		);
	}

	if ( ! $consent ) {
		return new WP_Error(
			'validation_error',
			'Необходимо согласие на обработку персональных данных.',
			array( 'status' => 400 )
		);
	}

	if ( in_array( $form_type, array( 'one_click', 'preorder' ), true ) && '' === $product_name ) {
		return new WP_Error(
			'validation_error',
			'Не указано название товара.',
			array( 'status' => 400 )
		);
	}

	$subjects = array(
		'callback'  => 'Заявка на обратный звонок',
		'one_click' => 'Заказ в 1 клик',
		'preorder'  => 'Заявка на предзаказ',
	);

	$subject = $subjects[ $form_type ] . ' - beastfpv.ru';

	$rows = array(
		beastfpv_forms_row( 'Тип формы', $form_type ),
		beastfpv_forms_row( 'Имя', $name ),
		beastfpv_forms_row( 'Телефон', $phone ),
	);

	if ( '' !== $message ) {
		$rows[] = beastfpv_forms_row( 'Сообщение', nl2br( esc_html( $message ) ) );
	}

	if ( '' !== $product_name ) {
		$rows[] = beastfpv_forms_row( 'Товар', $product_name );
	}

	if ( '' !== $product_id ) {
		$rows[] = beastfpv_forms_row( 'ID товара', $product_id );
	}

	if ( '' !== $product_price ) {
		$rows[] = beastfpv_forms_row( 'Цена', $product_price );
	}

	if ( '' !== $page_url ) {
		$rows[] = beastfpv_forms_row( 'Страница', esc_html( $page_url ) );
	}

	$rows[] = beastfpv_forms_row( 'Дата', current_time( 'Y-m-d H:i:s' ) );
	$rows[] = beastfpv_forms_row( 'IP', beastfpv_forms_get_client_ip() );

	$body = '<h2>Новая заявка с сайта</h2><table cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;">' . implode( '', $rows ) . '</table>';

	$to        = apply_filters( 'beastfpv_forms_recipient_email', 'order@beastfpv.ru' );
	$from_name = apply_filters( 'beastfpv_forms_from_name', 'BeastFPV' );
	$from_mail = apply_filters( 'beastfpv_forms_from_email', 'info@beastfpv.ru' );
	$headers   = array(
		'Content-Type: text/html; charset=UTF-8',
		sprintf( 'From: %s <%s>', $from_name, $from_mail ),
		sprintf( 'Reply-To: %s <%s>', $from_name, $from_mail ),
	);

	$sent = wp_mail( $to, $subject, $body, $headers );

	if ( ! $sent ) {
		return new WP_Error(
			'mail_send_failed',
			'Не удалось отправить письмо. Попробуйте позже.',
			array( 'status' => 500 )
		);
	}

	return new WP_REST_Response(
		array(
			'success' => true,
			'message' => 'Заявка отправлена.',
		),
		200
	);
}

function beastfpv_forms_row( $label, $value ) {
	return sprintf(
		'<tr><td style="border:1px solid #e5e7eb;font-weight:600;">%s</td><td style="border:1px solid #e5e7eb;">%s</td></tr>',
		esc_html( $label ),
		(string) $value
	);
}

function beastfpv_forms_normalize_phone( $value ) {
	$phone = preg_replace( '/\D+/', '', (string) $value );
	if ( 11 === strlen( $phone ) && '8' === substr( $phone, 0, 1 ) ) {
		$phone = '7' . substr( $phone, 1 );
	}

	if ( strlen( $phone ) < 10 ) {
		return '';
	}

	return $phone;
}

function beastfpv_forms_rate_limit_passed( $form_type ) {
	$ip     = beastfpv_forms_get_client_ip();
	$key    = 'beastfpv_form_rl_' . md5( $ip . '|' . $form_type );
	$max    = (int) apply_filters( 'beastfpv_forms_rate_limit_max', 5, $form_type );
	$window = (int) apply_filters( 'beastfpv_forms_rate_limit_window', 600, $form_type );

	$state = get_transient( $key );
	if ( ! is_array( $state ) ) {
		$state = array(
			'count'   => 0,
			'started' => time(),
		);
	}

	if ( time() - (int) $state['started'] >= $window ) {
		$state = array(
			'count'   => 0,
			'started' => time(),
		);
	}

	$state['count']++;
	set_transient( $key, $state, $window );

	return $state['count'] <= $max;
}

function beastfpv_forms_get_client_ip() {
	$keys = array(
		'HTTP_CF_CONNECTING_IP',
		'HTTP_X_REAL_IP',
		'HTTP_X_FORWARDED_FOR',
		'REMOTE_ADDR',
	);

	foreach ( $keys as $key ) {
		if ( empty( $_SERVER[ $key ] ) ) {
			continue;
		}

		$raw = wp_unslash( $_SERVER[ $key ] );
		$ip  = trim( explode( ',', $raw )[0] );

		if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			return $ip;
		}
	}

	return '0.0.0.0';
}
