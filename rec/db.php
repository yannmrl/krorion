<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    $uuid = $_GET['uuid'];
    if (isset($_GET['list']))
    {
        $list = [];
        $result = mysqli_query($con, "SELECT `id`, `name`, `claimed` FROM `KR-claim` WHERE uuid='$uuid'");
        while($row = mysqli_fetch_array($result))
            array_push($list, [$row['id'], $row['name'], $row['claimed']]);

        echo json_encode($list);
    }
    else if (isset($_GET['claim']))
    {
        $id = $_GET['claim'];
        $result = mysqli_query($con, "SELECT count(*) as c FROM `KR-claim` WHERE uuid='$uuid' AND id='$id' AND claimed=0");
        if (mysqli_fetch_array($result)['c'] == 0) {echo 0; return;}
        
        $sql = "UPDATE `KR-claim` SET claimed = 1 WHERE id=$id AND uuid='$uuid'";
        mysqli_query($con, $sql);
        echo 1;

        $filename = "debt.txt";
        $number = file_get_contents($filename);

        $number = floatval($number);
        $price = floatval($_GET['price']);

        if ($price > 2.5) return;
        else $number += $price;

        file_put_contents($filename, $number, LOCK_EX);
    }
?>