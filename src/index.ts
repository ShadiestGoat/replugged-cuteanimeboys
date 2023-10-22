import { Injector } from "replugged";
import { cfg, options } from "./settings/script";

const inject = new Injector();
// const logger = Logger.plugin("Cute Anime Boys");

interface Resp {
  img: string
  nsfw: boolean
  width: number
  height: number
}

export function start(): void {
  ["boy", "girl"].forEach((gender) => {
    inject.utils.registerSlashCommand({
      /* cspell: disable-next-line */
      name: `cuteanime${gender}s`,
      description: `Send cute anime ${gender}s in chat`,
      options: [
        {
          name: "cat",
          description: `Should this send a cute anime cat ${gender}? (default = false)`,
          type: 5,
          required: false,
        },
        {
          name: "nsfw",
          description: `If set, it will request specifically an nsfw/not nsfw content. Set default in settings`,
          type: 3,
          choices: options.map(({label, value}) => ({
            name: label,
            displayName: label,
            value,
          }))
        },
        {
          name: "dry",
          description: `If set true will do a 'dry run', only showing you a preview`,
          type: 5,
          required: false,
        },
      ],
      executor: async (i) => {
        const resp = await fetch(`https://redditCache.shadygoat.eu/r/${i.getValue("cat", false) ? "cat" : ""}${gender}?nsfw=${i.getValue("nsfw", cfg.get("nsfwFilter"))}`)
        const body: Resp = await resp.json()

        if (i.getValue("dry", false)) {
          return {
            send: false,
            embeds: [
              {
                image: {
                  url: body.img,
                  proxyURL: body.img,
                  width: body.width,
                  height: body.height,
                }
              }
            ]
          }
        }
  
        return {
          send: true,
          result: body.img,
        };
      },
    })
  })
}

export function stop(): void {
  inject.uninjectAll();
}

export { Settings } from "./settings/settings";
