<?php
    $c = file_get_contents('_stopari.php');
    file_put_contents('db.php', $c);
    echo "pari fermé"
?>