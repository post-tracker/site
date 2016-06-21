<?php
include( '../includes/default.php' );

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
<rss version="2.0"
    xmlns:atom="http://www.w3.org/2005/Atom"
    xmlns:ark="http://arkdevtracker.com">
    <channel>
        <title>ARK Dev Feed</title>
        <link>http://arkdevtracker.com</link>
        <description>Feed with the latest posts from the ARK: Survival Evolved developers</description>
        <language>en-us</language>
        <pubDate><?php echo date( DATE_RSS ); ?></pubDate>
        <atom:link href="http://arkdevtracker.com/actions/rss.php" rel="self" type="application/rss+xml" />
        <?php
        $PDO->execute();
        while( $post = $PDO->fetch() ) :
            ?>
            <item>
                <title><?php echo $post->topic; ?></title>
                <description><![CDATA[<?php echo $post->content; ?>]]></description>
                <link><?php echo $post->url; ?></link>
                <guid><?php echo $post->url; ?></guid>
                <pubDate><?php echo date( DATE_RSS, $post->timestamp ); ?></pubDate>
                <ark:source><?php echo $post->source; ?></ark:source>
                <ark:from><?php echo $post->nick; ?></ark:from>
            </item>
            <?php
        endwhile;
        ?>
    </channel>
</rss>
