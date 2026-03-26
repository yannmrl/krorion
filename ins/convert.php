<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    header('Content-Type: application/json');

    $videoPath = $_FILES['media']['tmp_name'];
    $videoName = $_FILES['media']['name'];

    $uuid = $_POST['uuid'];
    $desc = str_replace("'", "%|%", $_POST['desc']);

    if (!mysqli_fetch_array(mysqli_query($con, "SELECT * FROM `KR-sh` WHERE `filiere` = 'LIS' AND `uuid` = '$uuid'"))) return;
    
    $result = mysqli_query($con, "SELECT count(*) as c FROM `KR-pho` WHERE 1");
    $row = mysqli_fetch_array($result);

    $filename = $row['c'].'.mp4';

    $ch = curl_init();

    $post =
    [
        'video' => new CURLFile($videoPath, mime_content_type($videoPath), $videoName)
    ];

    curl_setopt_array($ch,
    [
        CURLOPT_URL => "https://echo.wysigot.com/convert",
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $post,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_BINARYTRANSFER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 200)
    {
        $savePath = "photos/".$filename;
        file_put_contents($savePath, $response);

        $ch2 = curl_init();

        curl_setopt_array($ch2,
        [
            CURLOPT_URL => "https://echo.wysigot.com/convert-webp",
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $post,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_BINARYTRANSFER => true,
        ]);

        $response2 = curl_exec($ch2);
        $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);

        if ($httpCode2 == 200)
        {
            $savePath2 = "photos/".$row['c'].".webp";
            file_put_contents($savePath2, $response2);

            mysqli_query($con, "INSERT INTO `KR-pho`(`description`, `ext`) VALUES ('$desc', 'mp4')");
            echo json_encode(["status" => 1]);
        }
        else echo json_encode(["status" => 0, "state" => 1]);
    }
    else echo json_encode(["status" => 0, "state" => 0]);
?>