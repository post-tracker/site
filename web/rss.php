<?php
include( 'includes/default.php' );

$query = 'SELECT
        posts.topic,
        posts.topic_url,
        posts.url,
        posts.content,
        posts.timestamp,
        developers.nick,
        developers.role,
        accounts.identifier,
        posts.source
    FROM
        posts,
        developers,
        accounts
    WHERE
        developers.id = posts.uid
    AND
        accounts.uid = posts.uid
    AND
        accounts.service = posts.source
    ORDER BY
        posts.timestamp
    DESC
    LIMIT
        100';
$PDO = $database->prepare( $query );

header( 'Content-Type: application/rss+xml;' );
?>
<?xml version="1.0"?>
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
        $PDO->execute();
        $usedGuids = array();
        while( $post = $PDO->fetch() ) :
            if( in_array( $post->url, $usedGuids ) ) {
                continue;
            }
            $usedGuids[] = $post->url;
            ?>
            <item>
                <title><?php echo htmlspecialchars( html_entity_decode( $post->topic ) ); ?></title>
                <description><![CDATA[<?php echo $post->content; ?>]]></description>
                <link><?php echo $post->url; ?></link>
                <guid><?php echo $post->url; ?></guid>
                <pubDate><?php echo date( DATE_RSS, $post->timestamp ); ?></pubDate>
                {{#rss}}
                {{{.}}}
                {{/rss}}
            </item>
            <?php
        endwhile;
        ?>
    </channel>
</rss>
