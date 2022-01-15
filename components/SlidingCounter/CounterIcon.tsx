import { AntDesign } from "@expo/vector-icons";
import Animated, {
	AnimatedStyleProp,
	StyleProps,
} from "react-native-reanimated";

interface IconProps {
	name: any;
	// style?: AnimatedStyleProp<Animated.AnimateStyle<StyleProps>>;
	style?: StyleProps;
	color?: string;
	size?: number;
}

const AnimatedCounterIcon = ({
	name,
	color = "#fafafa",
	size = 20,
	style,
}: IconProps) => {
	return (
		<Animated.View style={style}>
			<AntDesign name={name} color={color} size={size} />
		</Animated.View>
	);
};

export default AnimatedCounterIcon;
