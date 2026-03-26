<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['found']))
    {
        $id = $_GET['found'];
        $uuid = $_GET['uuid'];
     
        $result = mysqli_query($con, "SELECT `found_cha` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $fc = mysqli_fetch_array($result)['found_cha'];
        if (strpos($fc, $id) !== false) return;

        $fc = $fc.$id;

        mysqli_query($con, "UPDATE `KR-sh` SET `points_cha` = `points_cha` + 10, `found_cha` = $fc WHERE `uuid` = '$uuid'");
    }
    else if (isset($_GET['get_found']))
    {
        $uuid = $_GET['get_found'];
        $result = mysqli_query($con, "SELECT `found_cha` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $fc = mysqli_fetch_array($result)['found_cha'];

        echo $fc;
    }
    else if (isset($_GET['getpos'])) echo '[{"id": 1,"x": 442,"y": 327},{"id": 2,"x": 663,"y": 593},{"id": 3,"x": 804,"y": 505},{"id": 4,"x": 161,"y": 910}]';
?>