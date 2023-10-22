import { components, util } from "replugged";
import { cfg, options } from "./script";
const { Flex, SelectItem } = components;

export function Settings(): React.ReactElement {
  return (
    <Flex style={{ gap: "2vh" }} direction={Flex.Direction.VERTICAL}>
      <SelectItem
        {...util.useSetting(cfg, "nsfwFilter")}
        options={options}
        note="The nsfw option on commands overrides this">
        Include NSFW Pictures?
      </SelectItem>
    </Flex>
  );
}
