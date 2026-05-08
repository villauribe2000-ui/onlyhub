"use client";
import { useState } from "react";
import { Smile } from "lucide-react";

const emojis = [
	"😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
	"😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
	"😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
	"🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
	"😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮",
	"🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
	"🧐", "😕", "😟", "🙁", "😮", "😯", "😲", "😳", "🥺", "😦",
	"😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞",
	"😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿",
	"💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖",
];

const EmojiPicker = ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 hover:bg-muted rounded-full transition-colors"
			>
				<Smile className="w-5 h-5 text-muted-foreground" />
			</button>

			{isOpen && (
				<div className="absolute bottom-full left-0 mb-2 w-64 bg-white border rounded-xl shadow-xl p-3 z-50">
					<div className="grid grid-cols-8 gap-2">
						{emojis.map((emoji) => (
							<button
								key={emoji}
								type="button"
								onClick={() => {
									onEmojiSelect(emoji);
									setIsOpen(false);
								}}
								className="w-8 h-8 text-xl hover:bg-muted rounded-lg transition-colors"
							>
								{emoji}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default EmojiPicker;
