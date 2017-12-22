<?php
$url = 'https://api.kokarn.com/{{identifier}}/posts?excludeService=Twitter';

$fileContext = array(
    'ssl' => array(
        'verify_peer' => false,
        'verify_peer_name' => false,
    ),
);

$jsonData = file_get_contents( $url, false, stream_context_create( $fileContext ) );
$data = json_decode( $jsonData );

header( 'Content-Type: application/rss+xml;' );
?><?xml version="1.0"?>
<rss
    version="2.0"
    xmlns:atom="http://www.w3.org/2005/Atom"
    xmlns:{{identifier}}="https://{{hostname}}"
>
    <channel>
        <title>{{name}} Dev Feed</title>
        <link>https://{{hostname}}</link>
        <description>Feed with the latest posts from the developers</description>
        <language>en-us</language>
        <pubDate><?php echo date( DATE_RSS ); ?></pubDate>
        <atom:link href="https://{{hostname}}/rss" rel="self" type="application/rss+xml" />
        <?php
        $usedGuids = array();
        foreach( $data->data as $post ) :
            if( in_array( $post->url, $usedGuids ) ) {
                continue;
            }
            $guid = str_replace( $post->url, '&amp;' );
            $usedGuids[] = $guid;
            ?>
            <item>
                <title><?php echo htmlspecialchars( html_entity_decode( $post->topic ) ); ?></title>
                <description><![CDATA[<?php echo $post->content; ?>]]></description>
                <link><?php echo $guid; ?></link>
                <guid><?php echo $guid; ?></guid>
                <{{identifier}}:source><?php echo $post->account->service; ?></{{identifier}}:source>
                <{{identifier}}:from><?php echo $post->account->developer->nick; ?></{{identifier}}:from>
                <{{identifier}}:author><?php echo $post->account->developer->nick; ?></{{identifier}}:author>
                <pubDate><?php echo date( DATE_RSS, $post->timestamp ); ?></pubDate>
            </item>
            <?php
        endforeach;
        ?>
    </channel>
</rss>
