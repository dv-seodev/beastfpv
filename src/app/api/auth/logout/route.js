// app/api/auth/logout/route.js

export async function POST(request) {
    try {
        console.log('🚪 User logged out');

        return Response.json({
            success: true,
            message: 'Logged out successfully',
        });

    } catch (error) {
        console.error('❌ Logout error:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
