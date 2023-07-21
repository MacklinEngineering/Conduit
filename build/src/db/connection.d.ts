export declare function connectToDatabase(): Promise<{
    cluster: any;
    bucket: any;
    collection: any;
    profileCollection: any;
    articleCollection: any;
    commentCollection: any;
}>;
