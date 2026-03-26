<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    if (isset($_GET['get_posts']))
    {
        $res = [];
        $uuid = $_GET['get_posts'];
        $offset = $_GET['offset'];
        $limit = $_GET['limit'];
        $result0 = mysqli_query($con, "SELECT `liked` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $liked = mysqli_fetch_array($result0)['liked'];
        if (strlen($liked))
            $liked = array_map('intval', explode('|', $liked));
        else $liked = [];

        $result = mysqli_query($con, "SELECT * FROM `KR-pho` ORDER BY `id` DESC");// LIMIT $limit OFFSET $offset");
        while($row = mysqli_fetch_array($result))
        {
            $id = $row['id'];
            $result2 = mysqli_query($con, "SELECT count(*) as c FROM `KR-com` WHERE `post` = $id");
            $row2 = mysqli_fetch_array($result2);
            array_push($res, ["id" => $id, "desc" => str_replace('%|%', "'", $row['description']), "likes" => $row['likes'], "comms" => $row2['c'], "date" => $row['date'], "liked" => in_array($id, $liked), "ext" => $row['ext'], "ratio" => $row['ratio']]);
        }

        echo json_encode($res);
    }
    else if (isset($_GET['get_comms']))
    {
        $comms = [];
        $post = $_GET['get_comms'];
        $uuid = $_GET['uuid'];
        $result = mysqli_query($con, "SELECT `uuid`, `content` FROM `KR-com` WHERE `post` = $post");
        while ($row = mysqli_fetch_array($result))
        {
            $_uuid = $row['uuid'];
            $c = $row['content'];
            if ($uuid != $_uuid)
            {
                $result2 = mysqli_query($con, "SELECT CONCAT(UPPER(LEFT(prenom, 1)),LOWER(SUBSTRING(prenom, 2)),' ',UPPER(LEFT(nom, 1)),'.') AS prenom_nom FROM `KR-sh` WHERE `uuid` = '$_uuid'");
                while ($row2 = mysqli_fetch_array($result2))
                    array_push($comms, ["name" => $row2['prenom_nom'], "content" => $c]);
            }
            else array_push($comms, ["name" => "Moi", "content" => $c]);
        }   

        echo json_encode($comms);
    }
    else if (isset($_GET['comment']))
    {
        $uuid = $_GET['uuid'];
        $msg = $_GET['comment'];
        $post = $_GET['post'];
        $sql = "INSERT INTO `KR-com`(`post`, `uuid`, `content`) VALUES ('$post', '$uuid', '$msg')";
        mysqli_query($con, $sql);
    }
    else if (isset($_GET['like']))
    {
        $post = intval($_GET['like']);
        $uuid = $_GET['uuid'];
        $result = mysqli_query($con, "SELECT `liked` FROM `KR-sh` WHERE `uuid` = '$uuid'");
        $liked = array_map('intval', explode('|', mysqli_fetch_array($result)['liked']));
        if (count($liked) == 1 && $liked[0] == 0) $liked = [];
        if (in_array($post, $liked)) // unlike
        {
            unset($liked[array_search($post, $liked)]);
            echo 0;
            $sql2 = "UPDATE `KR-pho` SET `likes` = `likes`-1 WHERE `id` = '$post'";
        }
        else // like
        {
            array_push($liked, $post);
            echo 1;
            $sql2 = "UPDATE `KR-pho` SET `likes` = `likes`+1 WHERE `id` = '$post'";
        }
        $liked_str = implode('|', $liked);

        $sql = "UPDATE `KR-sh` SET `liked` = '$liked_str' WHERE `uuid` = '$uuid'";
        mysqli_query($con, $sql);
        mysqli_query($con, $sql2);
    }
    else if (isset($_GET['isListeux']))
    {
        $uuid = $_GET['isListeux'];
        if (mysqli_fetch_array(mysqli_query($con, "SELECT filiere FROM `KR-sh` WHERE uuid='$uuid'"))['filiere'] == 'LIS') echo 1;
        else echo 0;
    }
?>