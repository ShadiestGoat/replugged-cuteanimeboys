import { components, util } from "replugged";
import { cfg } from "./script";
const { Flex, SwitchItem } = components;

export function Settings(): React.ReactElement {
  return (
    <Flex style={{ gap: "2vh" }} direction={Flex.Direction.VERTICAL}>
      <SwitchItem
        {...util.useSetting(cfg, "includeNSFW")}
        note="If disabled, images marked as NSFW will be skipped">
        Include NSFW Pictures?
      </SwitchItem>
    </Flex>
  );
}
