<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");
    $mise_init = 50;

    if (isset($_GET['cotes']))
    {

        $mise1 = $mise_init;
        $mise2 = $mise_init;

        $result = mysqli_query($con, "SELECT `pari` FROM `KR-sh` WHERE 1");
        while($row = mysqli_fetch_array($result))
        {
            if ($row['pari'] < 0) $mise2 -= $row['pari'];
            else $mise1 += $row['pari'];
        }

        echo $mise1.'|'.$mise2;
    }
    else if (isset($_GET['mise']))
    {
        $expired = false;
        
        if ($expired)
        {
            echo "date passée";
            return;
        }

        $uuid = $_GET['uuid'];
        $mise = $_GET['mise'];

        $result = mysqli_query($con, "SELECT `pari` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        if (mysqli_fetch_array($result)['pari'] != 0) return;

        $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        if (mysqli_fetch_array($result)['krollars'] < abs($mise))
        {
            echo -1;
            return;
        }

        $sql = "UPDATE `KR-sh` SET `krollars` = `krollars` - ABS('$mise'), `dep_paris` = `dep_paris` + ABS('$mise'), `pari`='$mise' WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);
    }
    else if (isset($_GET['getmise']))
    {
        $uuid = $_GET['uuid'];

        $result = mysqli_query($con, "SELECT `pari` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        echo mysqli_fetch_array($result)['pari'];
    }
    else if (isset($_GET['solde']))
    {
        $uuid = $_GET['uuid'];

        $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        echo mysqli_fetch_array($result)['krollars'];
    }
    else if (isset($_GET['end']))
    {
        echo "calcul paris";
        $password = $_GET['password'];
        $gagnant = $_GET['end'];

        if ($password !== "XXX")
            return;

        $mise1 = $mise_init;
        $mise2 = $mise_init;

        $result = mysqli_query($con, "SELECT `pari`, `endpoint`, `p256dh`, `auth` FROM `KR-sh` WHERE 1");
        while($row = mysqli_fetch_array($result))
        {
            if ($row['pari'] < 0) $mise2 -= $row['pari'];
            else $mise1 += $row['pari'];
        }

        $cote1 = 1+$mise2/$mise1;
        $cote2 = 1+$mise1/$mise2;

        if ($gagnant == 0)
            $sql = "UPDATE `KR-sh` SET `krollars`=`krollars`+`pari`*'$cote1', `win_paris`=`win_paris`+`pari`*'$cote1', `pari`=0 WHERE `pari` > 0";
        else
            $sql = "UPDATE `KR-sh` SET `krollars`=`krollars`-`pari`*'$cote2', `win_paris`=`win_paris`-`pari`*'$cote2', `pari`=0 WHERE `pari` < 0";

        $sql2 = "UPDATE `KR-sh` SET `pari`=0 WHERE 1";

        mysqli_query($con, $sql);
        mysqli_query($con, $sql2);

        echo "pari terminé";
    }
    else if (isset($_GET['getpari']))
        echo "Est-ce que les bus seront à l'heure (avant ou après 11h) ?/Fermeture à 8h/Oui-Non";
?>