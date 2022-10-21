import { useQuery } from "@apollo/client";
import { Alert, List, Modal } from "antd";
import moment from "moment";
import {
  QUERY_RECENT_NODES,
  RecentNodesResult,
} from "../queries/query-recentNodes";

interface RecentNodesProps {
  onNodeSelected: (id: string) => void;
}

export const RecentNodes = ({ onNodeSelected }: RecentNodesProps) => {
  const { data, loading, error } =
    useQuery<RecentNodesResult>(QUERY_RECENT_NODES);
  if (error) {
    return <Alert type="error" message={error.message} />;
  }
  return (
    <Modal title="Recent nodes" open={true} footer={<></>} closable={false}>
      <List
        size="small"
        loading={loading}
        dataSource={data?.recentNodes || []}
        renderItem={(i) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => {
              onNodeSelected(i.id);
            }}
          >
            <List.Item.Meta title={i.name} />
            <>{moment(i.version).format("LLL")}</>
          </List.Item>
        )}
      />
    </Modal>
  );
};
