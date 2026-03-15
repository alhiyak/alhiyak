<?php
// إظهار الأخطاء (للتطوير)
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'vendor/autoload.php';
require_once 'config.php';

use Mtownsend\RemoveBg\RemoveBg;

// تحديد أن الرد سيكون JSON
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['product_image'])) {
    
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $original = $_FILES['product_image']['tmp_name'];
    $fileName = time() . '.png';
    $outputPath = $uploadDir . $fileName;
    
    try {
        $removeBg = new RemoveBg(REMOVE_BG_API_KEY);
        
        $removeBg->file($original)
            ->body([
                'bg_color' => 'white',
                'add_shadow' => true,
                'size' => '4k',
                'format' => 'png'
            ])
            ->save($outputPath);
        
        // رد JSON بنجاح
        echo json_encode([
            'success' => true,
            'path' => 'uploads/' . $fileName,
            'message' => 'تمت المعالجة بنجاح'
        ]);
        
    } catch (\Exception $e) {
        // إذا فشلت، انسخ الصورة الأصلية
        copy($original, $outputPath);
        
        echo json_encode([
            'success' => false,
            'path' => 'uploads/' . $fileName,
            'error' => $e->getMessage(),
            'message' => 'فشلت المعالجة وتم حفظ الصورة الأصلية'
        ]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'طلب غير صحيح']);
}
?>