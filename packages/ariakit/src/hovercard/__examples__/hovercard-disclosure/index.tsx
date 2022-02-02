import {
  Hovercard,
  HovercardAnchor,
  HovercardDisclosure,
  HovercardHeading,
  useHovercardState,
} from "ariakit/hovercard";
import "./style.css";

export default function Example() {
  const hovercard = useHovercardState({ gutter: 16, defaultVisible: true });
  return (
    <div className="wrapper">
      <HovercardAnchor
        state={hovercard}
        href="https://twitter.com/diegohaz"
        className="anchor"
      >
        @diegohaz
      </HovercardAnchor>
      <HovercardDisclosure state={hovercard} className="disclosure" />
      <Hovercard state={hovercard} className="hovercard">
        <a href="https://twitter.com/A11YProject" className="button">
          Follow
        </a>
        <img
          src="https://pbs.twimg.com/profile_images/1250803732931137537/oYqxqvW-_400x400.jpg"
          alt="Haz profile picture"
          className="avatar"
        />
        <HovercardHeading className="username">Haz</HovercardHeading>
        <p className="handle">@diegohaz</p>
        <p>
          Author of <a href="https://twitter.com/reakitjs">@reakitjs</a>.
          Autistic. I tweet about JavaScript, React, and web accessibility.
        </p>
        <div className="stats">
          <div>
            <span className="number">358</span> Following
          </div>
          <div>
            <span className="number">3,488</span> Followers
          </div>
        </div>
      </Hovercard>
    </div>
  );
}
