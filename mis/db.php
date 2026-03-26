<?php
    $con = mysqli_connect("XXX", "XXX", "XXX", "XXX");

    $mission = [];

    $result = mysqli_query($con, "SELECT * FROM `KR-mi` WHERE 1");
    while($row = mysqli_fetch_array($result))
        if ($row['current'] != -1)
            array_push($mission,
                array(
                    "id" => $row['id'],
                    "title" => $row['titre'],
                    "description" => $row['description'],
                    "bonus" => $row['bonus'],
                    "rewardAmount" => $row['reward'],
                    "maxCompletions" => $row['max'],
                    "currentCompletions" => $row['current']
                ));

    echo json_encode($mission);
?>