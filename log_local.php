<?php
// (Вимога 2.c)
header('Content-Type: application/json');
$logFile = 'local_log.json'; // Окремий файл для акумульованого логу

$jsonArrayData = file_get_contents('php://input');

if ($jsonArrayData) {
    // Просто зберігаємо весь отриманий масив у файл "як є"
    file_put_contents($logFile, $jsonArrayData, LOCK_EX);
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No data received']);
}
?>