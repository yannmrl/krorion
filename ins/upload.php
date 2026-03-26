<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    header('Content-Type: application/json');

    $maxSize = 50 * 1024 * 1024;

    $uuid = $_POST['uuid'];
    $file = $_FILES['media'];
    $desc = str_replace("'", "%|%", $_POST['desc']);

    if (!mysqli_fetch_array(mysqli_query($con, "SELECT * FROM `KR-sh` WHERE `filiere` = 'LIS' AND `uuid` = '$uuid'"))) return;

    $result = mysqli_query($con, "SELECT count(*) as c FROM `KR-pho` WHERE 1");
    $row = mysqli_fetch_array($result);

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!in_array($mime, $allowedMimes)) return;

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!($ext == "gif" | $ext == "webp")) $ext = "png";
    $fileName = $row['c'].'.'.$ext;

    $targetDir = __DIR__ . "/photos/";

    $files = glob($targetDir . $fileName);

    foreach ($files as $rfile)
    {
        if (is_file($rfile))
            unlink($rfile);
    }

    if ($file['size'] > $maxSize)
    {
        echo json_encode(["status" => 0]);
        return;
    }

    $targetFile = $targetDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetFile))
    {
        mysqli_query($con, "INSERT INTO `KR-pho`(`description`, `ext`) VALUES ('$desc', '$ext')");
        echo json_encode(["status" => 1]);
    }
    else echo json_encode(["status" => -1]);
?>