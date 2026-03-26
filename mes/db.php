<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['push']))
    {
        if ($_GET['password'] != 'XXX') return;
        $title = $_GET['push'];
        $sql = "INSERT INTO `KR-me`(`msg`) VALUES ('$title')";
        mysqli_query($con, $sql);
        $sql = "UPDATE `KR-sh` SET `notify` = 1 WHERE 1";
        mysqli_query($con, $sql);
        return;
    }
    
    $uuid = $_GET['uuid'];

    $sql = "UPDATE `KR-sh` SET `notify` = 0 WHERE `uuid` = '$uuid'";
    mysqli_query($con, $sql);

    $msgs = [];

    $result = mysqli_query($con, "SELECT * FROM `KR-me` WHERE 1");
    while($row = mysqli_fetch_array($result))
    {
        array_push($msgs,
        [
            'msg' => $row['msg'],
            'timestamp' => $row['timestamp']
        ]);
    }

    echo json_encode($msgs);
?>