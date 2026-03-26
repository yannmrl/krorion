<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    function hashr($str)
    {
        $key = 73;
        $bytes = array_values(unpack("C*", $str));
        foreach ($bytes as &$b)
            $b = $b ^ $key;
        $bin = pack("C*", ...$bytes);

        return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
    }

    function hashrinv($encoded)
    {
        $key = 73;
        $encoded .= str_repeat("=", (4 - strlen($encoded) % 4) % 4);
        $bin = base64_decode(strtr($encoded, '-_', '+/'));
        $bytes = array_values(unpack("C*", $bin));
        foreach ($bytes as &$b)
            $b = $b ^ $key;

        return pack("C*", ...$bytes);
    }

    if (isset($_GET['check']))
    {
        $tel = file_get_contents("allo.txt");
        $uuid = $_GET['check'];
        $result = mysqli_query($con, "SELECT `id_aurion` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        if ($username = mysqli_fetch_array($result)['id_aurion'])
        {
            echo $username."|".$tel;
            $sql = "UPDATE `KR-sh` SET `logged` = 1 WHERE `uuid` = '$uuid'";
            mysqli_query($con, $sql);
        }
        else echo "-1|".$tel;
        return;
    }
    else if (isset($_GET['log_from_aurion']))
    {
        $username = $_GET['username'];
        $password = $_GET['password'];

        $result = mysqli_query($con, "SELECT `uuid`, `password` FROM `KR-sh` WHERE `id_aurion` = '$username'");
        if ($row = mysqli_fetch_array($result))
        {
            if ($row['password'] == $password)
            {
                echo $row['uuid'];
                $sql = "UPDATE `KR-sh` SET `logged` = 1 WHERE `id_aurion` = '$username'";
                mysqli_query($con, $sql);
            }
            else echo -1;
        }
        else echo 0;
        return;
    }
    else if (isset($_GET['solde']))
    {
        $uuid = $_GET['solde'];
        $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        echo mysqli_fetch_array($result)['krollars'];
        return;
    }
    else if (isset($_GET['check_notif']))
    {
        $uuid = $_GET['check_notif'];
        $result = mysqli_query($con, "SELECT `notify` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        echo mysqli_fetch_array($result)['notify'];
        return;
    }
    else if (isset($_GET['isListeux']))
    {
        $uuid = $_GET['isListeux'];
        $result = mysqli_query($con, "SELECT `id_aurion` FROM `KR-sh` WHERE `uuid` = '$uuid' AND `filiere` = 'LIS'");
        if (mysqli_fetch_array($result)['id_aurion']) echo 1; else echo 0;
        return;
    }
    else if (isset($_GET['isListeuxAll']))
    {
        //echo 1; return;
        $uuid = $_GET['isListeuxAll'];
        $result = mysqli_query($con, "SELECT `id_aurion` FROM `KR-sh` WHERE `uuid` = '$uuid' AND (`filiere` = 'LIS' or `filiere` = 'LIX')");
        if (mysqli_fetch_array($result)['id_aurion']) echo 1; else echo 0;
        return;
    }    
    else if (isset($_GET['hashedIsListeux']))
    {
        $uuid = hashrinv($_GET['hashedIsListeux']);
        $result = mysqli_query($con, "SELECT `id_aurion` FROM `KR-sh` WHERE `uuid` = '$uuid' AND `filiere` = 'LIS'");
        if (mysqli_fetch_array($result)['id_aurion']) echo 1; else echo 0;
        return;
    }
    else if (isset($_GET['getPrenom']))
    {
        $uuid = $_GET['getPrenom'];
        $resArray = mysqli_fetch_array(mysqli_query($con, "SELECT `prenom`, `nom` FROM `KR-sh` WHERE `uuid` = '$uuid'"));
        echo ucfirst(strtolower($resArray['prenom'])) . " " . strtoupper($resArray['nom'][0]) . ".";

        return;
    }
    else if (isset($_GET['donate']))
    {
        $amount = $_GET['donate'];
        $uuid = $_GET['uuid'];
        $streamer = $_GET['streameruuid'];
        $result = mysqli_query($con, "SELECT `krollars` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        if (mysqli_fetch_array($result)['krollars'] < $amount)
        {
            echo 0;
            return;
        }

        $cagnotte = "cagnottelive.txt";
        $valeur = 0;
        if (file_exists($cagnotte))
        {
            $contenu = file_get_contents($cagnotte);
            $valeur = (int) $contenu;
        }

        $valeur += $amount;

        file_put_contents($cagnotte, $valeur);

        mysqli_query($con, "UPDATE `KR-sh` SET `krollars` = `krollars` - $amount, `donations` = `donations` + $amount WHERE `uuid` = '$uuid'");
        mysqli_query($con, "UPDATE `KR-sh` SET `givekro` = `givekro` + $amount WHERE `uuid` = '$streamer'");
        echo 1;

        return;
    }
    else if (isset($_GET['donationCagnotte']))
    {
        $cagnotte = "cagnottelive.txt";
        $valeur = 0;
        if (file_exists($cagnotte))
        {
            $contenu = file_get_contents($cagnotte);
            $valeur = (int) $contenu;

            echo $valeur;
        }
        else echo "erreur";

        return;
    }
    else if (isset($_GET['getViewerId']))
    {
        echo hashr($_GET['getViewerId']);
        return;
    }
    else if (isset($_GET['hashrinv']))
    {
        echo hashrinv($_GET['hashrinv']);
        return;
    }
    else if (isset($_GET['signup']))
    {
        function mixTo6($str)
        {
            $h = 0;
            $len = strlen($str);

            for ($i = 0; $i < $len; $i++)
                $h = ($h * 31 + ord($str[$i])) & 0xFFFFFFFF;

            $base36 = base_convert($h, 10, 36);
            return substr(str_pad($base36, 6, '0', STR_PAD_LEFT), -6);
        }

        function normalizeString($str)
        {
            $str = strtolower($str);

            $str = iconv("UTF-8", "ASCII//TRANSLIT//IGNORE", $str);

            $str = preg_replace('/[^a-z]/', '', $str);

            return $str;
        }

        function uuidv4()
        {
            $data = random_bytes(16);

            $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);

            $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

            return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
        }        

        if ($_GET['password'] != "XXX") return;

        $prenom = normalizeString($_GET['prenom']);
        $nom = normalizeString($_GET['nom']);
        $filiere = $_GET['filiere'];
        $mail = $_GET['mail'];
        $aurion = $nom . $prenom[0];
        $password = mixTo6($aurion);
        $uuid = uuidv4();

        mysqli_query($con, "INSERT INTO `KR-sh`(`id_aurion`, `filiere`, `prenom`, `nom`, `password`, `mail`, `uuid`) VALUES ('$aurion', '$filiere', '$prenom', '$nom', '$password', '$mail', '$uuid')");

        return;
    }
    else if (isset($_GET['getlisteux']))
    {
        if ($_GET['getlisteux'] !== "XXX")
        {
            echo "mot de passe incorrect";
            return;
        }
        $result = mysqli_query($con, "SELECT `prenom`, `password`, `id_aurion`, `mail`, `uuid` FROM `KR-sh` WHERE `filiere` = 'LIS'");
        while ($row = mysqli_fetch_array($result))
            echo strtoupper($row['prenom'][0]).substr($row['prenom'], 1).';'.$row['password'].';'.$row['id_aurion'].';'.$row['mail'].';'.$row['uuid'].'<br>';
        return;
    }
    else if (isset($_GET['geteveryone']))
    {
        if ($_GET['geteveryone'] !== "XXX")
        {
            echo "mot de passe incorrect";
            return;
        }
        $result = mysqli_query($con, "SELECT `prenom`, `password`, `id_aurion`, `mail`, `uuid` FROM `KR-sh` WHERE 1");
        while ($row = mysqli_fetch_array($result))
            echo strtoupper($row['prenom'][0]).substr($row['prenom'], 1).';'.$row['password'].';'.$row['id_aurion'].';'.$row['mail'].';'.$row['uuid'].'<br>';
        return;
    }
    else if (isset($_GET['getlogged']))
    {
        $result = mysqli_query($con, "SELECT `prenom`, `nom` FROM `KR-sh` WHERE `logged`=1 and `prenom`!='lefugitif'");
        while ($row = mysqli_fetch_array($result))
            echo strtoupper($row['prenom'][0]).substr($row['prenom'], 1)." ".strtoupper($row['nom'][0]).".".';';
        return;        
    }
    else if (isset($_GET['savegeo']))
    {
        $arr = [];
        $result = mysqli_query($con, "SELECT `id`, `km` FROM `KR-sh` WHERE `km`!=20000");
        while ($row = mysqli_fetch_array($result))
            array_push($arr, [$row['id'], $row['km']]);
        echo json_encode($arr);
        return;        
    }

    $prenom = $_GET['prenom'];
    $nom = $_GET['nom'];
    $uuid = $_GET['uuid'];
    $id = $_GET['id'];
    $pwd = $_GET['pwd'];

    $result = mysqli_query($con, "SELECT `uuid` FROM `KR-sh` WHERE `prenom` = '$prenom' AND `nom` = '$nom'");
    if ($_uuid = mysqli_fetch_array($result)['uuid'])
        echo $_uuid;
    else echo -3;
?>