import CrmAuthGuard from "./CrmAuthGuard";

export default function CrmHome() {
  return (
    <CrmAuthGuard>
      {() => (
        <div className="flex h-full items-center justify-center p-12">
          <div className="text-center">
            <p
              className="font-tan-pearl text-[40px] text-[#1c1a16]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Welcome
            </p>
            <p className="font-manrope mt-2 text-sm text-[#9e9890]">
              Select a section from the sidebar.
            </p>
          </div>
        </div>
      )}
    </CrmAuthGuard>
  );
}
