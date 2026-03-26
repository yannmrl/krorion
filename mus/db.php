<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['getfavs']))
    {
        $uuid = $_GET['getfavs'];
        $result = mysqli_query($con, "SELECT `favs` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        echo mysqli_fetch_array($result)['favs'];
    }
    else if (isset($_GET['setfavs']))
    {
        $favs = $_GET['setfavs'];
        $uuid = $_GET['uuid'];
        $sql = "UPDATE `KR-sh` SET `favs` = '$favs' WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);
    }
?>