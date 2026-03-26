<?php

    foreach ($_GET as $key => $value)
    {
        if (!preg_match('/^[a-zA-Z0-9\-_]+$/', $value)) {
            die("Entrée invalide pour $key");
        }
    }

    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");
    $maxCoins = 25;
    $uuid = $_GET['uuid'];

    if (isset($_GET['isalive']))
    {
        $alive = mysqli_fetch_array(mysqli_query($con, "SELECT `alive` FROM `KR-sh` WHERE `uuid` = '$uuid'"))['alive'];
        if ($alive == -1) echo -1;
        else if ($alive == 0)
        {
            echo -1;
            mysqli_query($con, "UPDATE `KR-sh` SET `alive` = -1 WHERE `uuid` = '$uuid'");
        }
        else if ($alive == 1)
        {
            echo 1;
            //mysqli_query($con, "UPDATE `KR-sh` SET `alive` = 0 WHERE `uuid` = '$uuid'");
        }
    }
    else if (isset($_GET['began']))
    {
        $uuid = $_GET['began'];
        mysqli_query($con, "UPDATE `KR-sh` SET `alive` = 0 WHERE `uuid` = '$uuid'");
    }
    else if (isset($_GET['win']))
    {
        $result = mysqli_query($con, "SELECT `alive` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        if (mysqli_fetch_array($result)['alive'] != 0) return;
        $win = $_GET['win'];
        if ($win > $maxCoins) return;
        $win = (int) $win;
        $sql = "UPDATE `KR-sh` SET `pieces` = `pieces` + $win , `alive` = -1 WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);
    }
    else if (isset($_GET['revive']))
    {
        $sql = "UPDATE `KR-sh` SET `alive` = 1, `deposit_errors` = 0 WHERE 1";
        mysqli_query($con, $sql);
    }
?>