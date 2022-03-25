export default class OpenPullRequest {
    id: number;
    number: number;
    title: string;
    author: string;
    commit_count: Number;

    constructor(id, number, title, author, commit_count) {
        this.id = id,
        this.number = number,
        this.title = title,
        this.author = author,
        this.commit_count = commit_count
    }
}
