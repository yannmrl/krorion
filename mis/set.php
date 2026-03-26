<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");
    if ($_GET['password'] == "XXX")
    {
        $id_aurion = $_GET['aurion'];
        $points = $_GET['points'];
        mysqli_query($con, "UPDATE `KR-sh` set `points_mis2` = `points_mis2` + $points WHERE `id_aurion` = '$id_aurion'");
        echo "ok";
    }
    else if (isset($_GET['getmis']))
    {
        $result = mysqli_query($con, "SELECT `description` FROM `KR-mi` WHERE max=500");
        while($row = mysqli_fetch_array($result))
            echo $row['description'].'<br>';
    }
    else echo "notok";
?>