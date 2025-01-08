import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

interface Props {
  open: boolean;
  defaultComment?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comment: string) => void;
}

function TaskStatusChangeDialog({
  open,
  onOpenChange,
  defaultComment,
  onConfirm,
}: Props) {
  const [comment, setComment] = useState(defaultComment || "");

  useEffect(() => {
    setComment(defaultComment || "");
  }, [defaultComment]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter a comment for this status change"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button
              onClick={() => {
                onConfirm(comment);
                setComment("");
              }}
              disabled={!comment.trim()}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TaskStatusChangeDialog;
