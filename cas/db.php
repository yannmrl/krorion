<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    $uuid = $_GET['uuid'];  
    $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
    $solde = mysqli_fetch_array($result)['krollars'];

    if (isset($_GET['mise']))
    {
        $mise = $_GET['mise'];

        if ($mise > $solde)
        {
            echo -1;
            return;
        }

        $gain = 0;

        $cagnotte = file_get_contents("cagnotte.txt");
        $cagnotte += $mise;
        $r = rand(1, 100);
        $e = 0;

        if ($r <= 23 && $cagnotte >= $mise * 2)
        {
            $e = 1;
            $gain = $mise * 2;
        }
        else if ($r >= 92 && $cagnotte >= $mise * 3)
        {
            $e = 3;
            $gain = $mise * 3;
        }
        else if ($r >= 86 && $r < 92 && $cagnotte >= $mise * 5)
        {
            $e = 2;
            $gain = $mise * 5;
        }

        file_put_contents("cagnotte.txt", $cagnotte-$gain);

        $sql = "UPDATE `KR-sh` SET `krollars` = `krollars` + $gain - $mise WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);

        $diff = $gain-$mise;
        if ($diff > 0) $sql2 = "UPDATE `KR-sh` SET `win_casino` = `win_casino` + $diff WHERE `uuid` = '$uuid'";
        else $sql2 = "UPDATE `KR-sh` SET `dep_casino` = `dep_casino` - $diff WHERE `uuid` = '$uuid'";

        mysqli_query($con, $sql2);

        echo $e."|".$gain;
    }
    else if (isset($_GET['solde']))
    {
        echo $solde;
    }
?>