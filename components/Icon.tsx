
type IconProps = React.SVGProps<SVGSVGElement> & { name: string };
export default function Icon({name, ...props}: IconProps) {
  return (
    <svg {...props} aria-hidden="true">
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
}