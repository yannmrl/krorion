<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['uncovered']))
    {
        $arr = array();
        $result = mysqli_query($con, "SELECT `id`, `nom` FROM `KR-rec` WHERE `won` = 1");
        while($row = mysqli_fetch_array($result))
            array_push($arr, [$row['id']-1, $row['nom']]);
        
        $result = mysqli_query($con, "SELECT COUNT(*) as `total` FROM `KR-rec` WHERE 1");
        echo mysqli_fetch_array($result)['total'].'||'.json_encode($arr);
    }
    else if (isset($_GET['uncover']))
    {
        $result = mysqli_query($con, "SELECT `id`, `nom` FROM `KR-rec` WHERE `won` = 0 ORDER BY RAND() LIMIT 1");
        $row = mysqli_fetch_array($result);
        $id = $row['id']-1;

        echo $id.'|'.$row['nom'];

        $sql = "UPDATE `KR-rec` SET `won` = 1 WHERE `id` = '$id'";
        mysqli_query($con, $sql);
    }
    else if (isset($_GET['code']))
    {
        $code = $_GET['code'];
        $result = mysqli_query($con, "SELECT `prenom` FROM `KR-qr` WHERE `code` = '$code'");
        if ($row = mysqli_fetch_array($result))
        {
            if ($row['prenom'] == "") echo 1;
            else echo $row['prenom'];
        }
        else echo 0;
    }
    else if (isset($_GET['mail']))
    {
        $uuid = $_GET['mail'];
        $price = $_GET['price'];
        $code = $_GET['codeX'];
        $result = mysqli_query($con, "SELECT `prenom` FROM `KR-qr` WHERE `code` = '$code'");
        if ($row = mysqli_fetch_array($result))
        {
            if ($row['prenom'] == "")
            {
                $result = mysqli_query($con, "SELECT prenom, nom FROM `KR-sh` WHERE uuid = '$uuid'");
                $row = mysqli_fetch_array($result);
                $prenom = $row['prenom'];
                $nom = $row['nom'];
                $name = ucfirst($prenom) . ' ' . strtoupper($nom[0]) . '.';
                $sql = "UPDATE `KR-qr` SET prenom = '$name' WHERE code = '$code'";
                mysqli_query($con, $sql);
                
                $to = "shopkr16@gmail.com";
                $subject = $prenom . " " . $nom . " a gagné une récompense";
                $message = "récompense : ". $price;
                $headers = "From: shop@kartel.fr";

                mail($to, $subject, $message, $headers);

                $sql = "INSERT INTO `KR-claim`(`uuid`, `name`) VALUES ('$uuid', '$price')";
                mysqli_query($con, $sql);
            }
        }        
    }
?>