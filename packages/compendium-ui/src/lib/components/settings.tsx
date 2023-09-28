import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Affix, Button, List, Popover, Space, Switch, Typography } from "antd";
import { SettingsContext } from "../contexts/settings";
import { useContext } from "react";

export const Settings = () => {
  const { settings, setSettings } = useContext(SettingsContext);

  const handleChange = (enabled: boolean) => {
    setSettings({ clusteringEnabled: enabled });
  };
  return (
    <Affix style={{ zIndex: 1000, position: "absolute", top: 30, left: 30 }}>
      <div>
        <Popover
          content={
            <List bordered>
              <List.Item>
                <Typography.Text mark>click on the node</Typography.Text> -
                focus specific node (open drawer on the right side)
              </List.Item>
              <List.Item>
                <Typography.Text mark>double-click on the node</Typography.Text> -
                select specific node (this will reset all previous selection)
              </List.Item>
              <List.Item>
                <Typography.Text mark>
                  shift + click on the node
                </Typography.Text>{" "}
                - select another node
              </List.Item>
              <List.Item>
                <Typography.Text mark>
                  shift + click on the already selected node
                </Typography.Text>{" "}
                - unselect node
              </List.Item>
              <List.Item>
                <Typography.Text mark>
                  double-click on the cluster
                </Typography.Text>{" "}
                - open cluster
              </List.Item>
            </List>
          }
          trigger="click"
        >
          <div>
            <Button>
              <InfoCircleOutlined rev={undefined} />
            </Button>
          </div>
        </Popover>
        <Popover
          content={
            <Space direction="vertical">
              <Switch
                checkedChildren={<CheckOutlined rev={undefined} />}
                unCheckedChildren={<CloseOutlined rev={undefined} />}
                onChange={(enabled) => handleChange(enabled)}
                defaultChecked={settings.clusteringEnabled}
              />{" "}
              enable clustering
            </Space>
          }
          trigger="click"
        >
          <div>
            <Button>
              <SettingOutlined rev={undefined} />
            </Button>
          </div>
        </Popover>
      </div>
    </Affix>
  );
};
