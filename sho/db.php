<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    $products = [];

    $i = 1;

    $result = mysqli_query($con, "SELECT * FROM `KR-ar` WHERE 1");
    while($row = mysqli_fetch_array($result))
    {
        array_push($products,
        [
            'id' => $i,
            'name' => $row['name'],
            'price' => $row['price'],
            'description' => $row['description'],
            'stock' => $row['stock'],
            'limit' => $row['limite']
        ]);
        $i++;
    }

    $n = $i-1;

    $uuid = $_GET['uuid'];

    if (isset($_GET['amount']))
    {
        $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $res = mysqli_fetch_array($result);
        echo $res['krollars'];
    }
    else if (isset($_GET['command']))
    {
        $result = mysqli_query($con, "SELECT `limits` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $limit = json_decode(mysqli_fetch_array($result)['limits']);

        $price = 0;
        $cibles = $_GET['cibles'];
        $msg = "";

        for ($i = 1; $i <= $n; $i++)
        {
            if ($limit->{$products[$i-1]['name']} + $_GET[$i] > $products[$i-1]['limit'] && $products[$i-1]['limit'] > 0)
            {
                echo -2;
                return;
            }
            else $limit->{$products[$i-1]['name']} += $_GET[$i];

            if ($products[$i-1]['stock'] < $_GET[$i] && $products[$i-1]['stock'] >= 0)
            {
                echo -3;
                return;
            }

            $price += $_GET[$i] * $products[$i-1]['price'];

            if ($_GET[$i])
                $msg = $msg . $_GET[$i] . " " . $products[$i-1]['name'] . "\n";
        }

        if ($_GET[5]) $msg = $msg . "cibles : " . $cibles;
        $msg = $msg . "\nprix : K" . $price;

        $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $res = mysqli_fetch_array($result);
        if ($res['krollars'] < $price) echo -1;
        else
        {
            for ($i = 1; $i <= $n; $i++)
            {
                $s = $_GET[$i];
                $sql = "UPDATE `KR-ar` SET `stock` = `stock` - $s WHERE `id` = '$i' AND `stock` > 0";
                mysqli_query($con, $sql);       
                $name_ = $products[$i-1]['name'];
                if ($i > 3) continue;
                for ($j = 0; $j < $s; $j++)
                {
                    $sql = "INSERT INTO `KR-claim`(`uuid`, `name`) VALUES ('$uuid', '$name_')";
                    mysqli_query($con, $sql);
                }
            }

            $limit = json_encode($limit);

            $sql = "UPDATE `KR-sh` SET `krollars` = `krollars` - $price, `dep_boutique` = `dep_boutique` + $price, `limits` = '$limit' WHERE `uuid` = '$uuid'";
            mysqli_query($con, $sql);            

            $result = mysqli_query($con, "SELECT `prenom`, `nom`, `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
            $res = mysqli_fetch_array($result);
            $prenom = $res['prenom'];
            $nom = $res['nom'];

            $to = "listebarbecue@isae-supmeca.fr";
            $to2 = "shopkr16@gmail.com";
            $subject = "Commande de " . $prenom . " " . $nom;
            $message = $msg;
            $headers = "From: kartel@red.fr";

            mail($to, $subject, $message, $headers);
            mail($to2, $subject, $message, $headers);

            echo $res['krollars'];
        }
    }
    else if (isset($_GET['products']))
    {
        $result = mysqli_query($con, "SELECT `limits` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $limit = mysqli_fetch_array($result)['limits'];
        if (count($limit) != count($products))
        {
            $limit2 = [];
            foreach ($products as $p)
                $limit2[$p['name']] = 0;

            if ($limit == "")
                $limit = json_encode($limit2);
            else
            {
                $limit2 = json_decode(json_encode($limit2), true);

                $limit = json_decode($limit, true);            
                $limit += $limit2;
                $limit = json_encode($limit);
            }

            $sql = "UPDATE `KR-sh` SET `limits` = '$limit' WHERE `uuid` = '$uuid'";
            mysqli_query($con, $sql);            
        }

        echo json_encode($products).'|'.$limit;
    }
?>