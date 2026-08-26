<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);

// можно проверить входные данные (опционально)
$confirmed = isset($input['confirmed']) && $input['confirmed'] === true;

if ($confirmed) {
    // 10 лет (почти "бесконечно")
    $expire = time() + (60 * 60 * 24 * 365 * 10);

    setcookie(
        'policy_confirmed',
        '1',
        [
            'expires' => $expire,
            'path' => '/',
            'httponly' => false,
            'secure' => !empty($_SERVER['HTTPS']),
            'samesite' => 'Lax',
        ]
    );

    echo json_encode([
        'success' => true
    ]);
    exit;
}

echo json_encode([
    'success' => false,
    'message' => 'Invalid request'
]);