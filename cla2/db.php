<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");
    
    $arr = array();

    $uuid = $_GET['uuid'];

    $result0 = mysqli_query($con, "SELECT `prenom`, `nom` FROM `KR-sh` WHERE `uuid` = '$uuid'");
    $row0 = mysqli_fetch_array($result0);
    $prenom = $row0['prenom'];
    $nom = $row0['nom'];

    $result = mysqli_query($con, "SELECT `prenom`, `nom`, `krollars`, `dep_boutique`, `win_casino`, `dep_casino`, `win_paris`, `dep_paris`, `donations`, `points_mis2`, `points_wan` FROM `KR-sh` WHERE 1");
    while($row = mysqli_fetch_array($result))
        array_push($arr, [$row['prenom'], $row['nom'], $row['krollars'], $row['dep_boutique'], $row['win_casino'], $row['dep_casino'], $row['win_paris'], $row['dep_paris'], $row['donations'], $row['points_mis2'], $row['points_wan']]);

    echo $prenom."|".$nom."/".json_encode($arr);
?>