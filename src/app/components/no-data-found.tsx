import { TableCell, TableRow } from "@/components/ui/table";
import { FileX2 } from "lucide-react";

interface NoDataFoundProps {
    colSpan: number;
}

export const NoDataFound = ({ colSpan }: NoDataFoundProps) => {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="h-24 text-center w-full">
                <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                    <FileX2 className="h-10 w-10 mb-2" />
                    <span className="text-lg font-medium">No data found</span>
                    <span className="text-sm">
                        There are no items to display.
                    </span>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default NoDataFound;
