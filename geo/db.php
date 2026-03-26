<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['find']))
    {
        $uuid = $_GET['uuid'];

        $result = mysqli_query($con, "SELECT `id` FROM `KR-sh` WHERE `uuid` = '$uuid' AND length(`lat`) > 0");
        $res = mysqli_fetch_array($result);
        $file = fopen("pos.txt", "r") or die("Unable to open file!");
        $pos = fread($file, filesize("pos.txt"));
        fclose($file);
        if($id = $res['id'] || $pos != "")
        {
            $arr = array();

            $result = mysqli_query($con, "SELECT `prenom`, `nom`, `lat`, `lng` FROM `KR-sh` WHERE length(`lat`) > 0");
            while($row = mysqli_fetch_array($result))
                array_push($arr, [$row['prenom'], $row['nom'], $row['lat'], $row['lng']]);
    
            echo json_encode($arr);    
        }
        else
            echo 0;
    }
    else if (isset($_GET['confirm']))
    {
        $uuid = $_GET['uuid'];
        $lat = $_GET['lat'];
        $lng = $_GET['lng'];

        $result = mysqli_query($con, "SELECT `lat` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        if (mysqli_fetch_array($result)['lat'] != 0) return;

        $sql = "UPDATE `KR-sh` SET `lat` = '$lat', `lng` = '$lng' WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);

        $arr = array();

        $result = mysqli_query($con, "SELECT `prenom`, `nom`, `lat`, `lng` FROM `KR-sh` WHERE 1");
        while($row = mysqli_fetch_array($result))
        {
            if (strlen($row['lat']))
                array_push($arr, [$row['prenom'], $row['nom'], $row['lat'], $row['lng']]);
        }

        echo json_encode($arr);
    }
    else if (isset($_GET['getloc']))
    {
        $file = fopen("pos.txt", "r") or die("Unable to open file!");
        echo fread($file, filesize("pos.txt"));
        fclose($file);
    }
    else if (isset($_GET['getname']))
    {
        $uuid = $_GET['uuid'];
        $result = mysqli_query($con, "SELECT `prenom`, `nom` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $r = mysqli_fetch_array($result);
        echo $r['prenom']."|".$r['nom'];
    }
    else if (isset($_GET['end']))
    {
        if ($_GET['end'] != 'XXX') return;
        $file = fopen("pos.txt", "r") or die("Unable to open file!");
        $pos = fread($file, filesize("pos.txt"));
        fclose($file);
        $file = fopen("n.txt", "r") or die("Unable to open file!");
        $n = fread($file, filesize("n.txt"));
        fclose($file);
        $nm = (int) $n;
        $nm++;
        file_put_contents("n.txt", $nm);
        $result = mysqli_query($con, "SELECT `lat`, `lng`, `uuid` FROM `KR-sh` WHERE 1");
        while($row = mysqli_fetch_array($result))
        {
            $uuid = $row['uuid'];
            $lat = $row['lat'];
            $lng = $row['lng'];
            $multiplier = 1;
            if ($lat == 0 && $lng == 0)
            {
                $sql = "UPDATE `KR-sh` SET `km` = (`km`*($n-1) + 20000)/$n WHERE `uuid` = '$uuid'";
                mysqli_query($con, $sql);
            }
            else
            {
                $d = distanceBetweenPositions($pos, $lat, $lng)*$multiplier;
                $sql = "UPDATE `KR-sh` SET `km` = (`km`*($n-1) + $d)/$n WHERE `uuid` = '$uuid'";
                mysqli_query($con, $sql);
            }
        }
        echo "GUESS THE FUGITIF TERMINé";
    }
    else echo "je te vois";

    function distanceBetweenPositions(string $posString, float $lat2, float $lng2): float
    {
        list($lat1, $lng1) = explode('|', $posString);

        $lat1 = deg2rad((float)$lat1);
        $lng1 = deg2rad((float)$lng1);
        $lat2 = deg2rad($lat2);
        $lng2 = deg2rad($lng2);
        
        $dlat = $lat2 - $lat1;
        $dlng = $lng2 - $lng1;

        $a = sin($dlat / 2) ** 2 +
            cos($lat1) * cos($lat2) *
            sin($dlng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $earthRadius = 6371;

        return (int) round($earthRadius * $c);
    }
?>