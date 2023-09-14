import { Injector, Logger, common, types } from "replugged";
import { type AnyRepluggedCommand } from "replugged/dist/types";

const {
  ApplicationCommandOptionType
} = types

const inject = new Injector();
const logger = Logger.plugin("PluginTemplate");

/**
 * Return a random int between min & max, inclusive.
 */
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type MediaMeta = {
  p: {u: string}[]
}

type RedditChild = {
  kind: string,
  data: {
    preview: {
      images: {
        source: {
          url: string
        }
      }[]
    },
    media_metadata: Record<string, MediaMeta>
  }
}

async function fetchReddit(subreddit: string): Promise<string> {
  try {
    const resp = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=100&t=all`)
    if (resp.status != 200) {
      throw `Non 200 status: ${resp.status}`
    }
    const body = await resp.json()
    const children = body?.data?.children as (unknown[] | undefined)
    if (!Array.isArray(children)) {
      throw "Unknown body: " + JSON.stringify(body)
    }
    if (children.length == 0) {
      throw "Empty children"
    }

    for (let i = 0; i < 10; i++) {
      const child = children[rand(0, children.length - 1)] as RedditChild
      if (!child) {
        continue
      }
      
      const childData = child.data

      if (child.kind != "t3" || !childData) {
        continue
      }

      let urlGotten: string;

      if (childData.preview && childData.preview.images?.length) {
        const images = childData.preview.images
        urlGotten = images[images.length - 1]?.source?.url ?? ""
      } else if (childData.media_metadata) {
        const keys = Object.keys(childData.media_metadata)

        let mediaMetaV: MediaMeta

        if (keys.length == 0) {
          continue
        } else if (keys.length == 1) {
          mediaMetaV = childData.media_metadata[keys[0]]
        } else {
          mediaMetaV = childData.media_metadata[keys[rand(0, keys.length - 1)]]
        }
        if ((mediaMetaV?.p ?? []).length === 0) {
          continue
        }

        urlGotten = mediaMetaV.p[mediaMetaV.p.length - 1]?.u ?? ""
      } else {
        continue
      }

      if (!urlGotten) {
        continue
      }

      // Remove stuff like &amp;
      return (new DOMParser()).parseFromString(urlGotten, "text/html").documentElement.textContent ?? ""
    }

    throw "failed to get an actual image"
  } catch (err) {
    logger.error(err)
  }

  return ""
}

function cmdFactory(baseSub: string, catSub: string, boy: "boy" | "girl"): AnyRepluggedCommand {
  return {
    name: `cuteanime${boy}s`,
    description: `Send cute anime ${boy}s in chat`,
    options: [
      {
        name: "cat",
        description: `Should this send a cute anime cat ${boy}? (default = false)`,
        type: ApplicationCommandOptionType.Boolean,
        required: false
      },
      {
        name: "dry",
        description: `If set true will do a 'dry run', only posting a link to the image in a private message`,
        type: ApplicationCommandOptionType.Boolean,
        required: false
      },
    ],
    executor: async (i) => {
      let sub = baseSub
      if (i.getValue("cat", false)) {
        sub = catSub
      }
  
      const result = await fetchReddit(sub)
  
      return {
        send: i.getValue("dry", true),
        result,
      }
    },
  }
}

export async function start(): Promise<void> {
  inject.utils.registerSlashCommand(cmdFactory("cuteanimeboys", "animecatboys", "boy"))
  inject.utils.registerSlashCommand(cmdFactory("CuteAnimeGirls", "CuteAnimeCatGirls", "girl"))
}

export function stop(): void {
  inject.uninjectAll();
}
