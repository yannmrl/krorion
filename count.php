<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");
    
    $connexions = mysqli_fetch_array(mysqli_query($con, "SELECT count(*) as c FROM `KR-sh` WHERE logged=1"))['c'];
    $notifications = mysqli_fetch_array(mysqli_query($con, "SELECT count(*) as c FROM `KR-sh` WHERE endpoint!=''"))['c'];
    $krollars = mysqli_fetch_array(mysqli_query($con, "SELECT sum(krollars) as c FROM `KR-sh` WHERE logged=1"))['c'];
    $boutique = mysqli_fetch_array(mysqli_query($con, "SELECT sum(dep_boutique) as c FROM `KR-sh` WHERE 1"))['c'];

    $krollars_r = $krollars/80;
    $boutique_r = $boutique/80;
    echo "<label style='font-size: 300%'>";
    echo "Connexions uniques : ".$connexions."<br>";
    echo "Appareils ayant activé les notifications : ".$notifications."<br>";
    echo "Krollars possédés : ".$krollars." (~".$krollars_r."€)<br>";
    echo "Krollars dépensés à la boutique : ".$boutique." (~".$boutique_r."€)<br>";
    echo "</label>";
?>