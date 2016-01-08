<?php
include( '../includes/default.php' );

$query = 'SELECT
        posts.topic,
        posts.url,
        posts.content,
        posts.timestamp
    FROM
        posts
    ORDER BY
        posts.timestamp
    DESC
    LIMIT
        100';
$PDO = $database->prepare( $query );

header( 'Content-Type: application/rss+xml;' );
?>
<?xml version="1.0"?>
<rss version="2.0">
    <channel>
        <title>ARK Dev Feed</title>
        <link>http://arkdevtracker.com</link>
        <description>Feed with the latest posts from the ARK: Survival Evolved developers</description>
        <language>en-us</language>
        <pubDate><?php echo date( DATE_RSS ); ?></pubDate>
        <?php
        $PDO->execute();
        while( $post = $PDO->fetch() ) :
            ?>
            <item>
                <title><?php echo $post->topic; ?></title>
                <description><![CDATA[<?php echo $post->content; ?>]]></description>
                <link><?php echo $post->url; ?></link>
                <pubDate><?php echo date( DATE_RSS, $post->timestamp ); ?></pubDate>
            </item>
            <?php
        endwhile;
        ?>
    </channel>
</rss>
