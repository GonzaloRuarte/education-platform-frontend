import parse from 'html-react-parser'

interface I_Props {
  htmlContent: string
}
const HTMLParser = ({ htmlContent }: I_Props) => {
  return <div className="htmlParsedContent">{parse(htmlContent)}</div>
}

export default HTMLParser
