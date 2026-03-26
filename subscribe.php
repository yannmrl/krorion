<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['uuid']))
    {
        $uuid = $_GET['uuid'];

        $endpoint = $_GET['endpoint'];
        $p256dh = $_GET['p256dh'];
        $auth = $_GET['auth'];

        $sql = "UPDATE `KR-sh` SET `endpoint` = '$endpoint', `p256dh` = '$p256dh', `auth` = '$auth' WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);    
    }
    else
    {
        $result = mysqli_query($con, "SELECT `endpoint`, `p256dh`, `auth` FROM `KR-sh` WHERE 1");
        $arr = array();

        while($row = mysqli_fetch_array($result))
            array_push($arr,
            [
                "endpoint" => $row['endpoint'],
                "keys" =>
                [
                    "p256dh" => $row['p256dh'],
                    "auth" => $row['auth']
                ]
            ]);

        echo json_encode($arr);
    }
//https://echo.wysigot.com/notify?password=XXX&title=Nouveau%20Trailer&body=La%20Cavale%20du%20Fugitif%20continue%20dans%20Bangkok%20%F0%9F%94%A5&image=vid/thu/T2.png&url=https://www.instagram.com/reel/DTH7vwukruS/
?>