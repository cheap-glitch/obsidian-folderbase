export interface FileLink {
	href: string;
	anchor: string;
}

export type FrontMatterValue = number | string | string[] | null;
export type FormattedFrontMatterValue = FrontMatterValue | FileLink | Array<string | FileLink>;

export type FileFrontMatter = Record<string, FrontMatterValue>;
export type FormattedFileFrontMatter = Record<string, FormattedFrontMatterValue>;
