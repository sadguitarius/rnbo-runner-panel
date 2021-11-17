import React, { useState } from "react";
import { NavLink } from "./navLink";
import { NavButton, NavOpen, MobileNavWrapper } from "./navStyle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Status from "../Status";
import PresetControl from "../PresetControl";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function MobileNav() {
	const [showNav, setShowNav] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const handleNavUpdate = () => {
			setShowNav(false);
		};

		router.events.on("routeChangeComplete", handleNavUpdate);

		return () => {
			router.events.off("routeChangeComplete", handleNavUpdate);
		};
	}, [router]);

	const openNav = () => {
		setShowNav(true);
	};

	const closeNav = () => {
		setShowNav(false);
	};
	return (
		<MobileNavWrapper shown={showNav}>
			<div className="mobile-header">
				<div className="header-group">
					<NavButton shown={showNav} onClick={openNav}>
						<FontAwesomeIcon id="menu" icon="bars" />
					</NavButton>
				</div>
				<div className="header-group">
					<Status />
					<PresetControl />
				</div>
			</div>
			<NavOpen shown={showNav}>
				<NavButton shown={showNav} onClick={closeNav}>
					<FontAwesomeIcon id="close" icon="times" />
				</NavButton>
				<NavLink href="/parameters" label="PARAMETERS"/>
				<NavLink href="/io" label="INPORTS / OUTPORTS"/>
				<NavLink href="/midi" label="MIDI CONTROL"/>
			</NavOpen>
		</MobileNavWrapper>
	);
}
