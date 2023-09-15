import { Injector, Logger, types } from "replugged";
import { type AnyRepluggedCommand } from "replugged/dist/types";
import { cfg } from "./settings/script";

const { ApplicationCommandOptionType } = types;

const inject = new Injector();
const logger = Logger.plugin("Cute Anime Boys");

/**
 * Return a random int between min & max, inclusive.
 */
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface MediaMeta {
  p: Array<{ u: string }>;
}

interface RedditChild {
  kind: string;
  data: {
    preview?: {
      images?: Array<{
        source: {
          url: string;
        };
      }>;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    media_metadata?: Record<string, MediaMeta>;
    thumbnail: string;
  };
}

async function fetchReddit(subreddit: string): Promise<string> {
  try {
    const resp = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=100&t=all`);
    if (resp.status != 200) {
      throw Error(`Non 200 status: ${resp.status}`);
    }
    const body = await resp.json();
    const children = body?.data?.children as RedditChild[] | undefined;
    if (!Array.isArray(children)) {
      logger.error("Unknown body", body);
      return "";
    }

    if (children.length == 0) {
      console.warn("Empty children resp", body);
      return "";
    }

    for (let i = 0; i < 10; i++) {
      const child = children[rand(0, children.length - 1)];
      const childData = child.data as RedditChild["data"] | undefined;

      if (child.kind != "t3" || !childData) {
        continue;
      }
      if (childData.thumbnail == "nsfw" && !cfg.get("includeNSFW")) {
        continue;
      }

      let urlGotten: string;

      if (childData.preview?.images?.length) {
        const { images } = childData.preview;
        urlGotten = images[images.length - 1]?.source?.url ?? "";
      } else if (childData.media_metadata) {
        const keys = Object.keys(childData.media_metadata);

        let mediaMetaV: MediaMeta;

        if (keys.length == 0) {
          continue;
        } else if (keys.length == 1) {
          mediaMetaV = childData.media_metadata[keys[0]];
        } else {
          mediaMetaV = childData.media_metadata[keys[rand(0, keys.length - 1)]];
        }
        if (((mediaMetaV.p as unknown[] | undefined) ?? []).length === 0) {
          continue;
        }

        urlGotten = mediaMetaV.p[mediaMetaV.p.length - 1]?.u ?? "";
      } else {
        continue;
      }

      if (!urlGotten) {
        logger.warn("Gotten past the location checks but still got not url");
        continue;
      }

      // Remove stuff like &amp;
      return (
        new DOMParser().parseFromString(urlGotten, "text/html").documentElement.textContent ?? ""
      );
    }

    logger.error("Failed to get the image (exceeded 10 attempts)");
  } catch (err) {
    logger.error(err);
  }

  return "";
}

function cmdFactory(baseSub: string, catSub: string, boy: "boy" | "girl"): AnyRepluggedCommand {
  return {
    /* cspell: disable-next-line */
    name: `cuteanime${boy}s`,
    description: `Send cute anime ${boy}s in chat`,
    options: [
      {
        name: "cat",
        description: `Should this send a cute anime cat ${boy}? (default = false)`,
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: "dry",
        description: `If set true will do a 'dry run', only posting a link to the image in a private message`,
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    executor: async (i) => {
      let sub = baseSub;
      if (i.getValue("cat", false) as boolean) {
        sub = catSub;
      }

      const result = await fetchReddit(sub);

      return {
        send: i.getValue("dry", true),
        result,
      };
    },
  };
}

export function start(): void {
  inject.utils.registerSlashCommand(cmdFactory("cuteanimeboys", "animecatboys", "boy"));
  inject.utils.registerSlashCommand(cmdFactory("CuteAnimeGirls", "CuteAnimeCatGirls", "girl"));
}

export function stop(): void {
  inject.uninjectAll();
}

export { Settings } from "./settings/settings";
