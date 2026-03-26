<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    $uuid = $_GET['uuid'];

    function wrong($u, $c)
    {
        $sql = "UPDATE `KR-sh` SET `deposit_errors` = `deposit_errors` + 1 WHERE `uuid` = '$u'";
        mysqli_query($c, $sql);
    }

    $result = mysqli_query($con, "SELECT `deposit_errors` FROM `KR-sh` WHERE `uuid` = '$uuid'");
    $row = mysqli_fetch_array($result);
    if ($row['deposit_errors'] >= 10)
    {
        echo -1;
        return;
    }

    if (isset($_GET['deposit'])) //deposit
    {
        $numero = $_GET['numero'];

        $result = mysqli_query($con, "SELECT `val` FROM `KR-bi` WHERE `numero` = '$numero' AND `claimed` = 0");
        $row = mysqli_fetch_array($result);
        if (!$row['val'])
        {
            wrong($uuid, $con);
            echo 0;
            return;
        }
        $val = $row['val'];

        $sql1 = "UPDATE `KR-sh` SET `krollars` = `krollars` + '$val' WHERE `uuid` = '$uuid'";
        $sql2 = "UPDATE `KR-bi` SET `claimed` = 1, `uuid` = '$uuid' WHERE `numero` = '$numero' AND `claimed` = 0 LIMIT 1";
        mysqli_query($con, $sql1);
        mysqli_query($con, $sql2);

        echo $val;
    }
    else if (isset($_GET['verify']))
    {
        $numero = $_GET['numero'];
        
        $result = mysqli_query($con, "SELECT `val` FROM `KR-bi` WHERE `numero` = '$numero' AND `claimed` = 0");
        $row = mysqli_fetch_array($result);
        if (!$row['val'])
        {
            wrong($uuid, $con);
            echo 0;
        }
        else echo $row['val'];
    }
?>