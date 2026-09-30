/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export',
  sassOptions: {
    implementation: 'sass-embedded',
  },
  trailingSlash: true,

  async redirects() {
    return [
      {
        source: '/category/dji/',
        destination: '/category/fpv/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/',
        destination: '/category/komplektuyushchie/',
        statusCode: 301,
      },

      // Комплектующие
      {
        source: '/category/accessory/kamery-dlya-fpv-dronov/',
        destination: '/category/komplektuyushchie/kamery-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/videoperedatchiki-dlya-fpv-dronov/',
        destination: '/category/komplektuyushchie/videoperedatchiki-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/kontrollery-poleta-dlya-fpv/',
        destination: '/category/komplektuyushchie/kontrollery-poleta-dlya-fpv/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/motory-dlya-fpv-dronov/',
        destination: '/category/komplektuyushchie/motory-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/propellery-dlya-fpv-dronov/',
        destination: '/category/komplektuyushchie/propellery-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/ramy-dlya-fpv-dronov/',
        destination: '/category/komplektuyushchie/ramy-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/priemniki-dlya-fpv/',
        destination: '/category/komplektuyushchie/priemniki-dlya-fpv/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/antenny-dlya-fpv-dronov/',
        destination: '/category/komplektuyushchie/antenny-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/mikrokompyutery/',
        destination: '/category/komplektuyushchie/mikrokompyutery/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/reaktivnye-dvigateli-dlya-dronov/',
        destination: '/category/komplektuyushchie/reaktivnye-dvigateli-dlya-dronov/',
        statusCode: 301,
      },

      // Аппаратура FPV
      {
        source: '/category/accessory/pulty-upravleniya-fpv-dronami/',
        destination: '/category/apparatura-fpv/pulty-upravleniya-fpv-dronami/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/ochki-dlya-fpv-dronov/',
        destination: '/category/apparatura-fpv/ochki-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/fpv-monitory/',
        destination: '/category/apparatura-fpv/fpv-monitory/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/videopriemniki-dlya-fpv-dronov/',
        destination: '/category/apparatura-fpv/videopriemniki-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/moduli-dlya-fpv-dronov/',
        destination: '/category/apparatura-fpv/moduli-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/retranslyatory-dlya-fpv-dronov/',
        destination: '/category/apparatura-fpv/retranslyatory-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/usiliteli-signala-dlya-fpv-dronov/',
        destination: '/category/apparatura-fpv/usiliteli-signala-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/optovolokno-dlya-dronov/',
        destination: '/category/apparatura-fpv/optovolokno-dlya-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/obnarujiteli-fpv-dronov/',
        destination: '/category/apparatura-fpv/obnarujiteli-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/podaviteli-fpv-dronov/',
        destination: '/category/apparatura-fpv/podaviteli-fpv-dronov/',
        statusCode: 301,
      },

      // Питание и обслуживание FPV
      {
        source: '/category/accessory/akkumulyatory/',
        destination: '/category/pitanie-i-obsluzhivanie-fpv/akkumulyatory/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/zaryadnye-ustrojstva-dlya-fpv-dronov/',
        destination:
          '/category/pitanie-i-obsluzhivanie-fpv/zaryadnye-ustrojstva-dlya-fpv-dronov/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/nabory-instrumentov-dlya-fpv/',
        destination:
          '/category/pitanie-i-obsluzhivanie-fpv/nabory-instrumentov-dlya-fpv/',
        statusCode: 301,
      },
      {
        source: '/category/accessory/prochie-tovary-dlya-fpv/',
        destination:
          '/category/pitanie-i-obsluzhivanie-fpv/prochie-tovary-dlya-fpv/',
        statusCode: 301,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: 'https://api.beastfpv.ru/wp-content/uploads/:path*',
      },
    ];
  },
  // basePath: '/out', // для GitHub Pages
  // assetPrefix: '/out', // для GitHub Pages
};

export default nextConfig;
