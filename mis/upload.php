<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    header('Content-Type: application/json');

    $maxSize = 50 * 1024 * 1024;

    $uuid = $_POST['uuid'];
    $id = $_POST['id'];
    $repost = $_POST['repost'];

    $test = mysqli_query($con, "SELECT (`max` <= `current`) as ok FROM `KR-mi` WHERE `id` = '$id'");
    if (mysqli_fetch_array($test)['ok'] == 1)
    {
        echo "already completed";
        return;
    }

    $result = mysqli_query($con, "SELECT `prenom`, `nom` FROM `KR-sh` WHERE `uuid` = '$uuid'");
    $row = mysqli_fetch_array($result);

    $prenom = $row['prenom'];
    $nom = $row['nom'];

    $baseName = $id . "_" . $prenom . "_" . $nom;

    if (!empty($_FILES['media']))
    {
        $targetDir = __DIR__ . "/uploads/";

        $files = glob($targetDir . $baseName . '.*');

        foreach ($files as $rfile)
        {
            if (is_file($rfile))
                unlink($rfile);
        }

        $file = $_FILES['media'];
        if ($file['size'] > $maxSize)
        {
            echo json_encode(["status" => 0]);
            return;
        }

        if ($repost == "false") $sufix = "-no-repost";
        else $sufix = "";

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = $baseName . $sufix . "." . $extension;
        $targetFile = $targetDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetFile))
        {
            echo json_encode(["status" => 1]);

            $to = "shopkr16@gmail.com";
            $subject = $prenom . " " . $nom . " a effectué la mission " . $id;
            $message = 'https://krorion.wysigot.com/mis/uploads/' . $fileName;
            $headers = "From: missions@kartel.fr";

            mail($to, $subject, $message, $headers);
        }
        else echo json_encode(["status" => -1]);
    }
?>