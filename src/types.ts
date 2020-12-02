export interface IOptions {
  context?: string
  mode?: 'production' | 'development'
  libsName?: string
  thmName?: string
  resource?: string
  sdkRoot?: string
}

export interface EXMLFile2 {
  filename: string;
  contents: string;
  className?: string;
  usedClasses?: string[];
  usedEXML?: string[];
  depends?: EXMLDepends;
  preload?: boolean;
  theme?: string;
}

export interface EXMLFile {
  path: string;
  theme?: string;
  preload?: boolean;
}

export interface EgretEUIThemeConfig {
  path: string;
  skins?: { [host: string]: string };
  exmls?: Array<any>;
  autoGenerateExmlsList?: boolean;
  styles?: any;
}

export interface EXMLDepends {
  [name: string]: boolean;
}