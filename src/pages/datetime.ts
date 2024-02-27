export function formatPubDate(pubDate : string) {
    const currentDate = new Date();
    const targetDate = new Date(pubDate);
    const differenceInTime = currentDate.getTime() - targetDate.getTime();
    const differenceInDays = Math.floor((differenceInTime + 3600 * 1000 * 9 ) / (1000 * 3600 * 24));

    if (differenceInDays === 0) {
        return '오늘';
    } else if (differenceInDays === 1) {
        return '어제';
    } else {
        return `${differenceInDays}일 전`;
    }
}