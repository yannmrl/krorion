<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['getbids']))
    {
        $uuid = $_GET['uuid'];

        $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $solde = mysqli_fetch_array($result)['krollars'];

        $lines = file("bid.txt", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $l)
        {
            $b = explode(" ", $l);
            $uuidX = $b[0];
            $result = mysqli_query($con, "SELECT `prenom`, `nom` FROM `KR-sh` WHERE `uuid` = '$uuidX'");
            $row = mysqli_fetch_array($result);
            $prenom = $row['prenom'];
            $nom = $row['nom'];
            echo ucfirst(strtolower($prenom))." ".strtoupper(substr($nom, 0, 1)) . '.'.'|'.$b[1]."-";
        }
        echo $solde;
    }
    else if (isset($_GET['bid']))
    {
        $expired = false;
        /*
        $dateString = explode('/', file_get_contents("lot.txt"))[1];
        $date = DateTime::createFromFormat('m-d-y H:i', trim($dateString));
        $now = new DateTime();

        if ($date < $now)
        {
            echo "date passée";
            return;
        }*/

        if ($expired)
        {
            echo "date passée";
            return;
        }

        $bid = $_GET['bid'];
        $uuid = $_GET['uuid'];

        $result = mysqli_query($con, "SELECT `krollars`, `prenom`, `nom` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $res = mysqli_fetch_array($result);
        
        if ($res['krollars'] < $bid)
        {
            echo -1;
            return;
        }

        $lines = file("bid.txt", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $lastLine = end($lines);

        $lastBidDetails = explode(" ", $lastLine);

        $lastBid = $lastBidDetails[1];

        if ($bid < $lastBid[1] + 10)
        {
            echo -2;
            return;
        }
        else
        {
            $sql = "UPDATE `KR-sh` SET `krollars` = `krollars` - $bid WHERE `uuid` = '$uuid'";
            mysqli_query($con, $sql);

            $uuidL = $lastBidDetails[0];
            $sql2 = "UPDATE `KR-sh` SET `krollars` = `krollars` + $lastBid WHERE `uuid` = '$uuidL'";
            mysqli_query($con, $sql2);

            $prenom = $res['prenom'];
            $nom = $res['nom'];

            file_put_contents("bid.txt", "\n".$uuid." ".$bid, FILE_APPEND);
            echo "1".'|'.ucfirst(strtolower($prenom))." ".strtoupper(substr($nom, 0, 1)) . '.';
            return;
        }
    }
    else if (isset($_GET['getbid']))
        echo "Dernier assassinat//assassinat.png";
?>