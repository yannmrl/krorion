<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    $uuid = $_GET['uuid'];

    if (isset($_GET['confirm']))
    {
        $w = $_GET['confirm'];
        $result = mysqli_query($con, "SELECT `wanted` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        if (mysqli_fetch_array($result)['wanted'] != -1) return;
        $sql = "UPDATE `KR-sh` SET `wanted` = $w WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);
    }
    else if (isset($_GET['is_confirmed']))
    {
        $r1 = mysqli_fetch_array(mysqli_query($con, "SELECT `wanted` FROM `KR-sh` WHERE `uuid` = '$uuid'"))['wanted'];
        echo $r1."|###|###|###|###";
    }
?>