<?php
try {
    preg_match('/(.*?)((\.co)?.[a-z]{2,4})$/i', $_SERVER['HTTP_HOST'], $m);
    $lang         = isset($m[2]) ? trim($m[2], ".") : '';
    $lang         = in_array($lang, array("se", "no", "fi", "de", "com")) ? $lang : '';
    $requestUri   = urlencode(trim($_SERVER['REQUEST_URI'], '/'));
    $subdomain    = reset(explode(".", $_SERVER['HTTP_HOST']));
    $apiPath      = "https://".$subdomain.".ridestore.com/rest-api/";
    $localMapping = $subdomain.".ridestore.com:443:127.0.0.1";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1);
    curl_setopt($ch, CURLOPT_RESOLVE, array($localMapping));  //php > 5.5
    curl_setopt($ch, CURLOPT_URL, $apiPath."rewrite?url=".$requestUri."&lang=".$lang);

    $rewrite = curl_exec($ch);
    if ($json = json_decode($rewrite, true)) {
        echo "window.PRELOADED_REWRITE = ".$rewrite.";";

        if (!empty($json["state"]) && $json["state"] == "category") {
            curl_setopt($ch, CURLOPT_URL, $apiPath."categories/".$json["id"]."?lang=".$lang);
            $urlData = curl_exec($ch);
        } elseif (!empty($json["state"]) && $json["state"] == "product-configurable") {
            curl_setopt($ch, CURLOPT_URL, $apiPath."products/".$json["id"]."?lang=".$lang);
            $urlData = curl_exec($ch);
        }
        curl_close($ch);

        if (!empty($urlData)) {
            echo "window.PRELOADED_PAGE_DATA = ".$urlData.";";
        }
    }
} catch (\Exception $e) { /* ... */ }
?>
